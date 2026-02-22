import React, { useContext, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PetContext } from "../Context/Context";
import {
  MDBCard,
  MDBCardBody,
  MDBCardImage,
  MDBCardText,
  MDBCol,
  MDBContainer,
  MDBIcon,
  MDBRow,
  MDBTypography,
} from "mdb-react-ui-kit";
import Button from "../Components/Button";
import "../Styles/Cart.css";

export default function Cart() {
  const navigate = useNavigate();

  const {
    fetchCart,
    handleCheckout,
    cart,
    handleQuantity,
    removeFromCart,
    handlePrice,
    totalPrice,
  } = useContext(PetContext);

  useEffect(() => {
    fetchCart();
  }, []);

  // ✅ Remove invalid products
  const validCart = useMemo(() => {
    return (cart || []).filter((item) => item?.product);
  }, [cart]);

  return (
    <section
      className="h-100 text-black"
      style={{
        backgroundColor: "#f8f9fa",
        paddingTop: "110px",
        paddingBottom: "80px",
      }}
    >
      <MDBContainer className="py-4 h-100">
        <MDBRow className="justify-content-center align-items-start">
          <MDBCol size="12">
            <MDBCard className="shadow-sm border-0" style={{ borderRadius: "20px" }}>
              <MDBCardBody className="p-0">
                <MDBRow className="g-0">

                  {/* LEFT SIDE */}
                  <MDBCol lg="8">
                    <div className="p-4 p-lg-5">
                      <MDBTypography tag="h4" className="fw-bold mb-4">
                        Shopping Cart
                      </MDBTypography>

                      {validCart.length === 0 ? (
                        <div className="text-center py-5">
                          <MDBIcon
                            fas
                            icon="shopping-cart"
                            size="3x"
                            className="text-muted mb-3"
                          />
                          <h5>Your cart is empty</h5>
                          <Button
                            color="dark"
                            className="mt-3"
                            onClick={() => navigate("/products")}
                          >
                            Continue Shopping
                          </Button>
                        </div>
                      ) : (
                        validCart.map((item) => (
                          <MDBRow
                            key={item._id}
                            className="mb-4 align-items-center border-bottom pb-3"
                          >
                            <MDBCol md="2">
                              <MDBCardImage
                                src={item.product?.image || ""}
                                alt={item.product?.title || "Product"}
                                fluid
                                className="rounded-3"
                                style={{
                                  maxHeight: "90px",
                                  objectFit: "cover",
                                }}
                              />
                            </MDBCol>

                            <MDBCol md="4">
                              <MDBTypography tag="h6" className="text-muted mb-1">
                                {item.product?.category}
                              </MDBTypography>
                              <MDBTypography tag="h6" className="fw-semibold">
                                {item.product?.title}
                              </MDBTypography>
                            </MDBCol>

                            <MDBCol
                              md="3"
                              className="d-flex align-items-center justify-content-center"
                            >
                              <Button
                                color="light"
                                className="px-2 border"
                                onClick={() =>
                                  handleQuantity(item.product._id, -1)
                                }
                              >
                                <MDBIcon fas icon="minus" />
                              </Button>

                              <span className="px-3 fw-bold">
                                {item.quantity}
                              </span>

                              <Button
                                color="light"
                                className="px-2 border"
                                onClick={() =>
                                  handleQuantity(item.product._id, 1)
                                }
                              >
                                <MDBIcon fas icon="plus" />
                              </Button>
                            </MDBCol>

                            <MDBCol md="2" className="text-end">
                              <MDBTypography tag="h6" className="fw-bold">
                                {handlePrice(
                                  (item.product?.price || 0) * item.quantity
                                )}
                              </MDBTypography>
                            </MDBCol>

                            <MDBCol md="1" className="text-end">
                              <MDBIcon
                                fas
                                icon="trash-alt"
                                className="text-danger"
                                style={{ cursor: "pointer" }}
                                onClick={() =>
                                  removeFromCart(item.product._id)
                                }
                              />
                            </MDBCol>
                          </MDBRow>
                        ))
                      )}

                      <div className="pt-4">
                        <MDBCardText
                          className="text-body fw-semibold"
                          style={{ cursor: "pointer" }}
                          onClick={() => navigate("/products")}
                        >
                          <MDBIcon
                            fas
                            icon="long-arrow-alt-left"
                            className="me-2"
                          />
                          Back to shop
                        </MDBCardText>
                      </div>
                    </div>
                  </MDBCol>

                  {/* RIGHT SIDE */}
                  <MDBCol lg="4" className="bg-light">
                    <div className="p-4 p-lg-5">
                      <MDBTypography tag="h4" className="fw-bold mb-4">
                        Order Summary
                      </MDBTypography>

                      <hr />

                      <div className="d-flex justify-content-between mb-4">
                        <MDBTypography className="text-muted">
                          Total
                        </MDBTypography>
                        <MDBTypography className="fw-bold">
                          {handlePrice(totalPrice)}
                        </MDBTypography>
                      </div>

                      <Button
                        color="dark"
                        className="w-100 rounded-pill py-2 fw-semibold"
                        disabled={validCart.length === 0}
                        onClick={handleCheckout}
                      >
                        Checkout
                      </Button>
                    </div>
                  </MDBCol>

                </MDBRow>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </section>
  );
}